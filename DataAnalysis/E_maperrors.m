files=dir('logs');
Sh = 2; Sw = 3;
F=0;
subjd = [];
subjdratio = [];
subjwithin = [];
subjcond = [];
subjcorr = [];
subjdollars = [];
for i=3:length(files)
    n = files(i).name
    try
        ldata = loadjson(['logs/' n]);
        F = F + 1;
    catch err
        error = 1;
        err
    end;
    
    d=ldata.exp1;
    A_distfromjson;
    subjcorr = [subjcorr r(2,1)];
    
    f = fieldnames(ldata);
    exp = f(3);
    exp = exp{1};
    expno = str2num(exp(length(exp)));
    d=ldata.(exp);
    
    names=fieldnames(d);
    N=length(names);
    for j=1:N
        t = d.(names{j});
        if isfield(t, 'rememberedX')
            real = t.real_coords;
            remembered = [cellfun(@str2num,t.rememberedX)' cellfun(@str2num,t.rememberedY)'];
            
            %[dd,remTrans,tr] = procrustes(real,remembered);
            %remembered = remTrans;
            
            %t.cluster_assignments
            allpairs = nchoosek(1:length(t.cluster_assignments), 2);
            ds = [];
            dratio = [];
            within = [];
            for k=1:length(allpairs)
                iswithin = t.cluster_assignments(allpairs(k, 1)) == t.cluster_assignments(allpairs(k, 2));
                within = [within iswithin];
                x1 = remembered(allpairs(k, 1), 1);
                y1 = remembered(allpairs(k, 1), 2);
                x2 = remembered(allpairs(k, 2), 1);
                y2 = remembered(allpairs(k, 2), 2);
                cd = sqrt((x2-x1)^2 + (y2-y1)^2);
                ds = [ds cd];
                x1 = real(allpairs(k, 1), 1);
                y1 = real(allpairs(k, 1), 2);
                x2 = real(allpairs(k, 2), 1);
                y2 = real(allpairs(k, 2), 2);
                crd = sqrt((x2-x1)^2 + (y2-y1)^2);
                dratio = [dratio 100/crd*cd];
                cond = t.condition;
                if isempty(cond)
                    cond = -1;
                end;
                subjcond = [subjcond cond];
                subjdollars = [subjdollars t.n_dollars];
            end;
            subjd = [subjd ds];
            subjwithin = [subjwithin within];
            subjdratio = [subjdratio dratio];
    %         [dd,remTrans,tr] = procrustes(real,remembered);
    %         scatter(real(:,1), real(:,2), 'b');
    %         hold on;
    %         scatter(remTrans(:,1), remTrans(:,2), 'r');
    %         hold off;
        end;
    end;
    
    if expno == 4 
        % different condition numbers for exp4 - tsp -.- 
        % DISTGROUPCOND = 2, REGCOND = 1, COLGROUPCOND=3;
        % exp2 - hyp.test - DISTGROUPCOND = 1, FUNCGROUPCOND=3, COLGROUPCOND=2;
        subjcond = subjcond - 1;
        subjcond(find(subjcond==0))=4; 
        % now always DISTGROUPCOND = 1, COLGROUPCOND=2, FUNCGROUPCOND=3, REGCOND = 4
    end;
end;

w=1;
scatter(subjd(find(subjwithin==w))./subjdratio(find(subjwithin==w)).*100, subjd(find(subjwithin==w)))
hold on;
w=0;
scatter(subjd(find(subjwithin==w))./subjdratio(find(subjwithin==w)).*100, subjd(find(subjwithin==w)), 'r')

legend('within cluster', 'between cluster')
xlabel('real distance')
ylabel('distance error')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)