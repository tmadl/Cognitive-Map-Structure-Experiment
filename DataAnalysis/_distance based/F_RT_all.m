allreald = [];
allestd = [];
allrt = [];
allcorrestd = [];
allworb = [];

allexpno = [];
allcondno = [];

allsubjid = [];

figure;
title('response times');

files=dir('logs');
for fi=3:length(files)    
    n = files(fi).name
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
    
    %B_biasfromjson;
    
    %allreald=[allreald reald];
    %allestd=[allestd estd];
    
    F_RT;
    
    idx = find(rt<30000);  % max 30 sec
    rt = rt(idx);
    worb = worb(idx);
    conditions = conditions(idx);
    reald = reald(idx);
    estd = estd(idx);
    
    allrt = [allrt rt];
    
    allreald=[allreald reald];
    allestd=[allestd estd];
    
    allworb=[allworb worb];
    
    allexpno = [allexpno repmat(expno, 1, length(rt))];
    
    allsubjid = [allsubjid repmat(fi-3, 1, length(rt))];
    
    hold on;
    %err=100./reald.*estd;
    errorbar(fi-3, mean(rt), std(rt), '.');
    
    allcondno = [allcondno conditions];
    
    b_estd = estd;
    
    d=ldata.exp1;
    A_distfromjson;
    %b_estd = b_estd .* p(1) + p(2);
    %allcorrestd = [allcorrestd b_estd];
    if length(r) > 1
        allcorrestd = [allcorrestd r(2,1)];
    else
        shit=1;
    end;
end;

% correct TSP numbering (dist 2, reg 1, col 3), to always have DISTGROUPCOND = 1, COLGROUPCOND=2, FUNCGROUPCOND=3, REGCOND = 4
allcondno(find(allcondno==1 & allexpno == 4)) = 4; % regular condition
allcondno(find(allcondno==2 & allexpno == 4)) = 1; % distance condition
allcondno(find(allcondno==3 & allexpno == 4)) = 2; % color condition

% filter = find(allreald > 60);
% allreald = allreald(filter);
% allestd = allestd(filter);
% allworb = allworb(filter);
% allexpno = allexpno(filter);
% allcondno = allcondno(filter);
% allsubjid = allsubjid(filter);



%allerr=(allestd-allreald);
%allerr=(100./allreald).*allestd;
%allerr = allestd > allreald;
[h,p]=ttest2(allrt(find(allworb==0)), allrt(find(allworb==1)));
within_mean_std = [mean(allrt(find(allworb==0))) std(allrt(find(allworb==0)))];
across_mean_std = [mean(allrt(find(allworb==1))) std(allrt(find(allworb==1)))];
disp('all conditions (h, p, rt_within_mean, rt_within_std,    rt_across_mean, rt_across_std)')
[h,p,within_mean_std,across_mean_std]

for c=1:4
    disp(['condition ' num2str(c)])
    [h,p]=ttest2(allrt(find(allworb==0 & allcondno == c)), allrt(find(allworb==1 & allcondno == c)));
    within_mean_std = [mean(allrt(find(allworb==0 & allcondno == c))) std(allrt(find(allworb==0 & allcondno == c)))];
    across_mean_std = [mean(allrt(find(allworb==1 & allcondno == c))) std(allrt(find(allworb==1 & allcondno == c)))];
    [h,p,within_mean_std/1000,across_mean_std/1000]
end;

figure;

%subplot(1,2,1);
title('response times')
scatter(allreald(find(allworb==0)), allrt(find(allworb==0)), 'b')
hold on;
scatter(allreald(find(allworb==1)), allrt(find(allworb==1)), 'r')
legend('within cluster', 'between cluster')
xlabel('real distance')
ylabel('response times')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)
scatter(1:500, 1:500, 1, 'k');

% subplot(1,2,2);
% title('distance errors')
% scatter(allreald(find(allworb==0)), allerr(find(allworb==0)), 'b')
% hold on;
% scatter(allreald(find(allworb==1)), allerr(find(allworb==1)), 'r')
% legend('within cluster', 'between cluster')
% xlabel('real distance')
% ylabel('distance error')
% h = lsline;
% set(h(1),'color','b','LineWidth',2)
% set(h(2),'color','r','LineWidth',2)
