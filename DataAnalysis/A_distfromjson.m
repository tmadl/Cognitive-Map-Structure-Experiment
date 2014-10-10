reald=[];
estd=[];

d=loadjson(json);
names=fieldnames(d);
N=length(names);
for i=1:N
    t = d.(names{i});
    estd = [estd t.distance_estimations(1)];
    reald = [reald t.real_distances(1)];
end;

r = corrcoef(estd, reald)

SSresid = sum((reald-estd).^2);
SStotal = ((length(reald)-1) * var(reald));
rsq = 1 - SSresid/SStotal

p=polyfit(estd', reald', 1);
yfit = estd*p(1)+p(2);

r_corr = corrcoef(estd, reald)

SSresid = sum((reald-yfit).^2);
SStotal = ((length(reald)-1) * var(reald));
rsq_corr = 1 - SSresid/SStotal

subplot(1,2,1)
plot(reald);
hold on;
plot(yfit, 'r');

subplot(1,2,2)
scatter(yfit, reald);