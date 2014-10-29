allreald = [];
allestd = [];
allcorrestd = [];
allworb = [];

allexpno = [];
allcondno = [];

allsubjid = [];

files=dir('logs');
for i=3:length(files)
    n = files(i).name
    try
        ldata = loadjson(['logs/' n]);
    catch err
        error = 1;
        err
        continue;
    end;
    f = fieldnames(ldata);
    exp = f(3);
    exp = exp{1};
    expno = str2num(exp(length(exp)));
    %if strfind(exp{1}, 'exp')
        d=ldata.(exp);
    %else
    %    d=ldata;
    %end;
    
    B_biasfromjson;
    
    allreald=[allreald reald];
    allestd=[allestd estd];
    allworb=[allworb worb];
    
    allexpno = [allexpno repmat(expno, 1, length(reald))];
    
    allsubid = [allexpno repmat(i-3, 1, length(reald))];
    
    if expno == 4 
        % different condition numbers for exp4 - tsp -.- 
        % [[DISTGROUPCOND = 2, REGCOND = 1, COLGROUPCOND=3;]]
        % exp2 - hyp.test - [[DISTGROUPCOND = 1, FUNCGROUPCOND=3, COLGROUPCOND=2;]]
        conditions = conditions - 1;
        conditions(find(conditions==0))=4; 
        % ! now always DISTGROUPCOND = 1, COLGROUPCOND=2, FUNCGROUPCOND=3, REGCOND = 4
    end;
    
    allcondno = [allcondno conditions];
    
    b_estd = estd;
    
    d=ldata.exp1;
    A_distfromjson;
    %b_estd = b_estd .* p(1) + p(2);
    %allcorrestd = [allcorrestd b_estd];
    allcorrestd = [allcorrestd r(2,1)];
end;

%allerr=(allestd-allreald);
allerr=(100./allreald).*allestd;
[h,p]=ttest(allerr(find(allworb==0)), allerr(find(allworb==1)));
between_mean_std = [mean(allerr(find(allworb==0))) std(allerr(find(allworb==0)))];
across_mean_std = [mean(allerr(find(allworb==1))) std(allerr(find(allworb==1)))];
disp('all conditions (h, p, between_mean, between_std,    across_mean, across_std)')
[h,p,between_mean_std,across_mean_std]

for c=1:4
    disp(['condition ' num2str(c)])
    [h,p]=ttest(allerr(find(allworb==0 & allcondno == c)), allerr(find(allworb==1 & allcondno == c)));
    between_mean_std = [mean(allerr(find(allworb==0 & allcondno == c))) std(allerr(find(allworb==0 & allcondno == c)))];
    across_mean_std = [mean(allerr(find(allworb==1 & allcondno == c))) std(allerr(find(allworb==1 & allcondno == c)))];
    [h,p,between_mean_std,across_mean_std]
end;

subplot(1,2,1);
title('distance errors')
scatter(allreald(find(allworb==0)), allestd(find(allworb==0)), 'b')
hold on;
scatter(allreald(find(allworb==1)), allestd(find(allworb==1)), 'r')
legend('within cluster', 'between cluster')
xlabel('real distance')
ylabel('estimated distance')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)
scatter(1:500, 1:500, 1, 'k');

subplot(1,2,2);
title('distance errors')
scatter(allreald(find(allworb==0)), allerr(find(allworb==0)), 'b')
hold on;
scatter(allreald(find(allworb==1)), allerr(find(allworb==1)), 'r')
legend('within cluster', 'between cluster')
xlabel('real distance')
ylabel('distance error')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)
